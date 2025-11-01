import os
import shutil
from tempfile import NamedTemporaryFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import RetrievalQA
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from langchain_core.prompts import PromptTemplate
from utils.config import llm_model, hf_embeddings


class RAGPipeline:

    def __init__(self):
        self.vectorstore = None
                
    def process_pdf(self, file):
        with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(file.file.read())
            temp_path = temp_pdf.name

        # Load and chunk PDF 
        docs = PyMuPDFLoader(temp_path).load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", "!", "?", " ", ""]
        )
        chunks = splitter.split_documents(docs)

        # Create vectorstore
        self.vectorstore = FAISS.from_documents(chunks, hf_embeddings)
        os.remove(temp_path)

        return {"message": "PDF processed successfully"}
    



    def query_pdf(self, query: str):
        if not self.vectorstore:
            return {"error": "No PDF loaded. Please upload a PDF first."}
            
        #Setup retriever with compression
        base_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 6})
        compressor = LLMChainExtractor.from_llm(llm_model)
        compression_retriever = ContextualCompressionRetriever(
            base_retriever=base_retriever,
            base_compressor=compressor
        )

        # QA Chain with improved prompt 
        qa_template = """Answer the question based on the given context. 
        Use the following process:
        1. Identify relevant information from the context
        2. Reason through the answer step-by-step
        3. Provide a clear, well-supported answer
        
        If you cannot find the complete answer in the context, say so clearly.
        Focus on accuracy and cite specific details from the context.
        
        Context: {context}
        Question: {question}
        
        Let's think step by step and provide a comprehensive answer:"""

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm_model,
            retriever=compression_retriever,
            chain_type="stuff",
            chain_type_kwargs={
                "prompt": PromptTemplate(
                    template=qa_template,
                    input_variables=["context", "question"]
                )
            }
        )

        # Use the chain with proper input format
        result = qa_chain.invoke({"query": query})
        return {"answer": result["result"]}
    



    def delete_pdf(self):
        """Clear the current PDF from memory"""
        if self.vectorstore:
            self.vectorstore = None
            return {"message": "PDF removed successfully"}
        return {"message": "No PDF loaded"}