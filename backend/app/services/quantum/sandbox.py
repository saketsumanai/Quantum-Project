import ast
from typing import Tuple, List

# Broad forbidden modules covering OS, I/O, subprocesses, networking, serialization, and reflection
FORBIDDEN_MODULES = {
    # System and OS interaction
    "os", "sys", "subprocess", "shutil", "importlib", "socket", "urllib", "requests", "http",
    "pty", "pickle", "ctypes", "builtins", "_thread", "threading", "multiprocessing",
    "posix", "posixpath", "nt", "ntpath", "gc", "resource", "signal", "errno",
    # File I/O and serialization
    "pathlib", "fileinput", "linecache", "tempfile", "shelve", "sqlite3", "codecs",
    "tarfile", "zipfile", "gzip", "bz2", "lzma", "shlex", "marshal", "dbm",
    # Network, asynchronous and external tools
    "asyncio", "concurrent", "webbrowser", "ftplib", "smtplib", "poplib", "imaplib",
    "telnetlib", "ssl", "xmlrpc", "socketserver",
    # Introspection and internal bytecode manipulation
    "inspect", "types", "code", "codeop", "dis", "trace", "tracemalloc", "cProfile", "profile",
    "sysconfig", "pip"
}

FORBIDDEN_IDENTIFIERS = {
    "__builtins__", "builtins", "breakpoint", "exit", "quit", "open", "eval", "exec",
    "compile", "input", "__import__", "globals", "locals", "getattr", "setattr", "delattr", "vars"
}

FORBIDDEN_METHOD_CALLS = {
    "system", "popen", "spawn", "spawnl", "spawnv", "execl", "execv", "fork"
}

# Permitted dunder attributes
SAFE_DUNDERS = {"__init__", "__name__", "__doc__"}


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

    def visit_Name(self, node: ast.Name):
        if node.id in FORBIDDEN_IDENTIFIERS:
            self.violations.append(f"Forbidden identifier access: '{node.id}'")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_IDENTIFIERS:
                self.violations.append(f"Forbidden function invocation: '{node.func.id}()'")
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in FORBIDDEN_METHOD_CALLS:
                self.violations.append(f"Forbidden method invocation: '{node.func.attr}()'")
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        if node.attr.startswith("__") and node.attr.endswith("__"):
            if node.attr not in SAFE_DUNDERS:
                self.violations.append(f"Access to special internal reflection attribute forbidden: '{node.attr}'")
        self.generic_visit(node)


def validate_python_quantum_code(code_str: str) -> Tuple[bool, List[str]]:
    """
    Statically analyzes user Python code to reject arbitrary code execution (RCE),
    file system manipulation, and sandbox reflection exploits.
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
