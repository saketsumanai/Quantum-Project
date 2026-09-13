import ast
from typing import Tuple, List

FORBIDDEN_MODULES = {
    "os", "sys", "subprocess", "shutil", "importlib", "socket", "urllib", "requests", "http",
    "pty", "pickle", "ctypes", "builtins", "posix", "gc", "resource"
}

FORBIDDEN_FUNCTIONS = {
    "eval", "exec", "compile", "open", "input", "__import__", "globals", "locals",
    "breakpoint", "getattr", "setattr", "delattr"
}

class SecurityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.violations: List[str] = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            base_mod = alias.name.split('.')[0]
            if base_mod in FORBIDDEN_MODULES:
                self.violations.append(f"Forbidden module import: '{alias.name}'")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            base_mod = node.module.split('.')[0]
            if base_mod in FORBIDDEN_MODULES:
                self.violations.append(f"Forbidden module from-import: '{node.module}'")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_FUNCTIONS:
                self.violations.append(f"Forbidden function invocation: '{node.func.id}()'")
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        if node.attr.startswith("__") and node.attr.endswith("__"):
            if node.attr not in ["__init__", "__name__", "__doc__"]:
                self.violations.append(f"Access to special internal attribute forbidden: '{node.attr}'")
        self.generic_visit(node)


def validate_python_quantum_code(code_str: str) -> Tuple[bool, List[str]]:
    """
    Statically analyzes user Python code to reject arbitrary code execution (RCE).
    Returns (is_safe: bool, violations: List[str]).
    """
    try:
        tree = ast.parse(code_str)
        visitor = SecurityVisitor()
        visitor.visit(tree)
        if visitor.violations:
            return False, visitor.violations
        return True, []
    except SyntaxError as e:
        return False, [f"Syntax Error: {e}"]
    except Exception as e:
        return False, [f"Parse Error: {str(e)}"]
