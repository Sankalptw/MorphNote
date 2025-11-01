import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import RetrievalQA
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from langchain_core.prompts import PromptTemplate
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq


class RAGPipeline:
    def __init__(self, pdf_path: str, groq_api_key: str):
        self.pdf_path = pdf_path
        
        self.llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.3, groq_api_key=groq_api_key)
        
        self.embeddings = HuggingFaceEmbeddings(model_name = "intfloat/e5-small-v2", encode_kwargs = {'normalize_embeddings':True},
    )
        
        self.vectorstore = None
        self._load_pdf()
    
    def _load_pdf(self):
        docs = PyMuPDFLoader(self.pdf_path).load()
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", "!", "?", " ", ""]
        )
        chunks = splitter.split_documents(docs)
        
        self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
    
    def query(self, question: str) -> dict:
        if not self.vectorstore:
            raise ValueError("Vector store not initialized")
        
        base_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 6})
        compressor = LLMChainExtractor.from_llm(self.llm)
        compression_retriever = ContextualCompressionRetriever(
            base_retriever=base_retriever,
            base_compressor=compressor
        )
        
        compressed_docs = compression_retriever.get_relevant_documents(question)
        contexts = [doc.page_content for doc in compressed_docs]
        
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
            llm=self.llm,
            retriever=compression_retriever,
            chain_type="stuff",
            chain_type_kwargs={
                "prompt": PromptTemplate(
                    template=qa_template,
                    input_variables=["context", "question"]
                )
            }
        )
        
        result = qa_chain.invoke({"query": question})
        
        return {
            "question": question,
            "answer": result["result"],
            "contexts": contexts
        }