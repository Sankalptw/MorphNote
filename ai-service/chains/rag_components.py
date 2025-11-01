import os
import shutil
from tempfile import NamedTemporaryFile
from langchain_community.document_loaders import PyMuPDFLoader  # faster than PyPDFLoader
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import RetrievalQA
from utils.config import llm_model, hf_embeddings


class RAGPipeline:
    def __init__(self):
        """Single PDF RAG pipeline with persistent vectorstore"""
        self.vectorstore = None
        
    def process_pdf(self, file):
        """Process and store a single PDF into a FAISS vectorstore"""
        with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(file.file.read())
            temp_path = temp_pdf.name

        # Load and chunk PDF
        docs = PyMuPDFLoader(temp_path).load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=100,
            separators=["\n\n", "\n", ".", "!", "?", " ", ""]
        )
        chunks = splitter.split_documents(docs)

        # Create vectorstore in memory
        self.vectorstore = FAISS.from_documents(chunks, hf_embeddings)
        os.remove(temp_path)

        return {"message": "PDF processed successfully"}

    def query_pdf(self, query: str):
        """Query the loaded PDF"""
        if not self.vectorstore:
            return {"error": "No PDF loaded. Please upload a PDF first."}

        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm_model,
            retriever=retriever,
            return_source_documents=True,
            chain_type="stuff"
        )

        result = qa_chain.invoke({"query": query})
        return {"answer": result["result"]}

    def delete_pdf(self):
        """Clear the current PDF from memory"""
        if self.vectorstore:
            self.vectorstore = None
            return {"message": "PDF removed successfully"}
        return {"message": "No PDF loaded"}
