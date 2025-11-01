from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.config import llm_model


def extract_keypoints(text: str):
    llm = llm_model
    prompt = PromptTemplate.from_template(
        """Analyze the following notes and extract the most crucial information, organizing it into clear, memorable one line key points:
        {text}

        Guidelines:
        - Identify and prioritize the main concepts, definitions, and core ideas
        - Preserve important technical terms, numbers, and specific details
        - Include any critical relationships between concepts
        - Maintain the original meaning while being more concise
        - Format each point to start with a clear topic or category

        Present the key points as bullet points, focusing on:
        • Main concepts and principles (most important)
        • Supporting details and examples (if crucial)
        • Definitions and technical terms (maintain exact wording)
        • Relationships and dependencies between ideas
        • Practical applications or implications (if mentioned)

        Format your response as concise, clear bullet points that capture the essence of the notes. Your job is for keypoint extraction, not a paragraph of summary.
        Remember you are assisting people with long notes to quickly look at the important things they need to go over"""
    )
    parser = StrOutputParser()
    chain = prompt | llm | parser

    result = chain.invoke({"text": text})

    return result
