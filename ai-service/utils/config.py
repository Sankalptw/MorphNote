from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

## LLM Model
llm_model = ChatGroq(model="openai/gpt-oss-20b", 
                     temperature=0.1, 
                     max_tokens=300,
                     groq_api_key=groq_api_key)

## Vector Embedding Model
hf_embeddings = HuggingFaceEmbeddings(
    model_name = "intfloat/e5-small-v2",
    encode_kwargs = {'normalize_embeddings':True},
    )