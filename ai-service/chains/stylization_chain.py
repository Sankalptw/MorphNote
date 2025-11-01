from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.config import llm_model
import json


base_prompt = PromptTemplate.from_template(
"""
You are an expert writing assistant who rewrites user notes in different notes and styles.

Input Text: {text}
Style to apply onto the input text: {style}
Optional preferences: {options}

Now rewrite the input text according to the given style and preferences.
Make sure to:
- Keep the meaning intact. Do NOT by any means change any logic of the text.
- Apply consistent tone. 
- Use clear grammar and flow
- Output only the stylized version (no explanations)
"""
)


STYLE_GUIDES = {
    "formal": "Use academic tone, complex vocabulary, and clear structure.",
    "professional": "Use concise, assertive language suitable for business writing.",
    "creative": "Add expressive and imaginative flair; vary sentence rhythm.",
    "concise": "Simplify language and shorten text while retaining meaning.",
    "casual": "Use friendly, conversational tone with natural phrasing.",
    "technical": "Use domain-accurate, objective terminology.",
}

def stylize_text(text: str, style: str, options: dict = None) -> str:
    style = style.lower()

    opts = {
        "guide": STYLE_GUIDES[style],
        "length": options.get("length", "medium") if options else "medium",
        "creativity": options.get("creativity", "balanced") if options else "balanced"
    }

    llm = llm_model
    parser = StrOutputParser()
    chain = base_prompt | llm | parser

    result = chain.invoke(
        {
            "text": text,
            "style": style,
            "options": json.dumps(opts, indent = 2)
        }
    )
    return result