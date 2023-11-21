# CodacusCoder Extension

This is a Visual Studio Code extension that provides inline code completions using local llm AI models.

## Requirements

This extension requires the following to be installed on your system:

* Ollama runtime: This is required for the machine learning model. Please refer to the [Ollama documentation](https://ollama.ai) for installation instructions.

## Extension Settings

This extension contributes the following settings:

* `codacusCoder.apiEndpoint`: The endpoint of the API used for code generation.
* `codacusCoder.model`: The model used for code generation.
* `codacusCoder.debounceTime`: The debounce time for code completion requests.

## Known Issues

There are no known issues at the moment. If you encounter a bug or have a feature request, please open an issue on the [GitHub repository](https://github.com/thecodacus/codacus-coder/issues).

## Release Notes

### 0.0.1

Initial release of CodacusCoder. This version provides basic inline code completions using a AI model.

Added the ability to enable or disable the extension by clicking the status bar item. Also made the API endpoint, model, and debounce time configurable through the extension settings.
