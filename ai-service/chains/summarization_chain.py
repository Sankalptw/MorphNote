from langchain_classic.chains import load_summarize_chain   
from langchain_core.prompts import PromptTemplate
from utils.config import llm_model
from langchain_core.documents import Document


def summarize_text_notes(text: str) -> str:
    doc = Document(page_content=text)
    
    template = """
    As an expert study notes summarizer, create a comprehensive yet concise summary of the following notes. 
    Focus on maintaining academic accuracy while making the content more digestible.

    NOTES TO SUMMARIZE:
    {text}

    GUIDELINES:
    1. Maintain all key technical terms, definitions, and crucial concepts
    2. Preserve the logical flow and relationships between ideas
    3. Include important examples or applications if present
    4. Keep numerical data and specific details when relevant
    5. Use clear, academic language while being more concise
    6. Organize information in a coherent narrative flow
    7. Highlight the most fundamental concepts

    SUMMARY:
    """

    prompt = PromptTemplate(
        input_variables=['text'],
        template=template
    )

    chain = load_summarize_chain(
        llm=llm_model,
        chain_type='stuff',
        verbose=False,
        prompt=prompt
    )
    
    summary = chain.run([doc])  

    return summary

