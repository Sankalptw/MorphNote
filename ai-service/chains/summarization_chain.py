from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.config import llm_model


def summarize_text_notes(text: str) -> str:
    """Summarize text to 40-50% of original length"""
    
    template = """You are a summarization expert. Reduce the following text to 40-50% of its original length.

INSTRUCTIONS:
- Extract ONLY the most critical information
- Use simple, direct sentences
- NO markdown, NO formatting, NO tables
- NO bullet points
- Plain text only
- Keep technical terms exact
- Must be 40-50% shorter than original

Original text ({original_length} characters):
{text}

Target length: approximately {target_length} characters

Summary (plain text, no formatting):"""

    original_length = len(text)
    target_length = int(original_length * 0.45)
    
    prompt = PromptTemplate(
        input_variables=['text', 'original_length', 'target_length'],
        template=template
    )

    chain = prompt | llm_model | StrOutputParser()
    
    summary = chain.invoke({
        'text': text,
        'original_length': original_length,
        'target_length': target_length
    })
    
    return summary.strip()
