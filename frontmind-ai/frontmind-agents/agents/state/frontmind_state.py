from typing import TypedDict


class FrontMindState(TypedDict):

    url: str

    screenshots: list

    html_content: str

    replicated_html: str

    evaluation: dict

    report: dict