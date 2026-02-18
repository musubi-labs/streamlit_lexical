from pathlib import Path

import setuptools

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setuptools.setup(
    name="streamlit_lexical",
    version="1.3.1",
    author="Ben F",
    author_email="ben@musubilabs.ai",
    description="Streamlit component that allows you to use Meta's Lexical rich text editor",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/musubi-labs/streamlit_lexical",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.7",
    install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit >= 1.36.0",
    ],
    extras_require={
        "devel": [
            "wheel",
            "pytest==7.4.0",
            "playwright==1.39.0",
            "requests==2.31.0",
            "pytest-playwright-snapshot==1.0",
            "pytest-rerunfailures==12.0",
        ]
    },
)
