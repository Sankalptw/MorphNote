from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.config import llm_model
import json


STYLE_PROMPTS = {
    "formal": """Rewrite in FORMAL academic style. Use:
- Complex sentence structures
- Sophisticated vocabulary
- Third-person perspective
- Professional tone
- But KEEP all facts, examples, and meaning IDENTICAL""",

    "professional": """Rewrite in PROFESSIONAL style. Use:
- Concise, direct language
- Business appropriate words
- Active voice
- Confident tone
- But KEEP all facts, examples, and meaning IDENTICAL""",

    "creative": """Rewrite in CREATIVE style. Use:
- Engaging descriptions
- Varied sentence rhythm
- Expressive language
- Dynamic tone
- But KEEP all facts, examples, and meaning IDENTICAL""",

    "concise": """Rewrite in CONCISE style. Use:
- Shorter sentences
- Simpler words
- Remove redundancy
- Direct phrasing
- But KEEP all facts, examples, and meaning IDENTICAL""",

    "casual": """Rewrite in CASUAL style. Use:
- Conversational language
- Simple words
- Contractions
- Friendly tone
- But KEEP all facts, examples, and meaning IDENTICAL""",

    "technical": """Rewrite in TECHNICAL style. Use:
- Domain-accurate terminology
- Precise language
- Objective tone
- Exact specifications
- But KEEP all facts, examples, and meaning IDENTICAL"""
}


def stylize_text(text: str, style: str, options: dict = None) -> str:
    style = style.lower()
    
    if style not in STYLE_PROMPTS:
        style = "formal"
    
    template = """TASK: Rewrite the following text with a different style.

CRITICAL CONSTRAINTS:
- Do NOT change any facts or concepts
- Do NOT add new examples
- Do NOT alter logic or meaning
- Do NOT remove important information
- ONLY change: tone, vocabulary level, and sentence structure

Style instructions:
{style_instruction}

Original text:
{text}

Rewritten text (ONLY the rewritten version, no explanations):"""

    prompt = PromptTemplate(
        input_variables=['text', 'style_instruction'],
        template=template
    )

    chain = prompt | llm_model | StrOutputParser()

    result = chain.invoke({
        'text': text,
        'style_instruction': STYLE_PROMPTS[style]
    })
    
    return result.strip()
