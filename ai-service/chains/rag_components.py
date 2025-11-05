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
from langchain_community.retrievers import BM25Retriever
from langchain_core.retrievers import BaseRetriever
from typing import List
from langchain_core.documents import Document
import numpy as np
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
import nltk
from nltk.tokenize import word_tokenize
from langchain_classic.retrievers import ContextualCompressionRetriever 
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder


class RAGPipeline:

    def __init__(self):
        self.vectorstore = None
        self.syntactic_retriever = None
                
    def process_pdf(self, file):
        with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(file.file.read())
            temp_path = temp_pdf.name

        # Load and chunk PDF 
        docs = PyMuPDFLoader(temp_path).load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,  # Increased for better context
            chunk_overlap=150, # Increased overlap for better coherence
            separators=["\n\n", "\n", ".", "!", "?", " ", ""],
            length_function=len
        )
        chunks = splitter.split_documents(docs)
        

        # Create vectorstore
        self.vectorstore = FAISS.from_documents(chunks, hf_embeddings)
        self.syntactic_retriever = BM25Retriever.from_documents(documents=chunks,preprocess_func= word_tokenize)
        os.remove(temp_path)

        return {"message": "PDF processed successfully"}
    


    def query_pdf(self, query: str):
        if not self.vectorstore:
            return {"error": "No PDF loaded. Please upload a PDF first."}
            
        #Setup retriever with compression
        #base_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 6})
        semantic_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})  
        hybrid_retriever = EnsembleRetriever(retrievers = [self.syntactic_retriever, semantic_retriever],
                                             weights = [0.45, 0.55])  
        
        
        #compressor = LLMChainExtractor.from_llm(llm_model)
        #compression_retriever = ContextualCompressionRetriever(
        #    base_retriever=hybrid_retriever,
        #    base_compressor=compressor
        #)
        
        reranker_model = HuggingFaceCrossEncoder(model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2")
        compressor = CrossEncoderReranker(model= reranker_model, top_n=3)
        compression_retriever = ContextualCompressionRetriever(base_compressor=compressor, base_retriever=hybrid_retriever)

        # QA Chain with improved prompt 
        qa_template = """Answer the question based ONLY on the given context. 
        Use the following structured process:
        1. First, identify and quote the specific relevant passages from the context
        2. Analyze these passages to form your answer
        3. Provide a concise answer (aim for 2-3 paragraphs maximum)
        4. If any part of the question cannot be answered from the context, explicitly state that
        
        Rules:
        - Do not make assumptions beyond the provided context
        - Use direct quotes when referring to specific information
        - Keep the response focused and relevant
        - Maintain consistent length in responses
        - Do not use special characters like (*, #) in your answer.
        - Cite the relevant passage in your answer. It should follow the format:- Relevant text from document: Relevant text 
        
        Final answer format should follow above rules and provide the answer to the question first, then cite the relevant passage below. 
        
        Context: {context}
        Question: {question}
        
        Reasoned Answer:"""

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

        result = qa_chain.invoke({"query": query})
        return {"answer": result["result"]}
    



    def delete_pdf(self):
        if self.vectorstore:
            self.vectorstore = None
            return {"message": "PDF removed successfully"}
        return {"message": "No PDF loaded"}