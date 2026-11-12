"""Build a Vercel API request from the checked static site artifact."""

import base64
import json
from pathlib import Path
import sys


artifact = Path(sys.argv[1])
project_id, commit = sys.argv[2:]
config = json.loads((artifact / "vercel.json").read_text())
files = [
    {
        "file": path.relative_to(artifact).as_posix(),
        "data": base64.b64encode(path.read_bytes()).decode("ascii"),
        "encoding": "base64",
    }
    for path in sorted(artifact.rglob("*"))
    if path.is_file()
]

json.dump(
    {
        "name": "usersau-docs",
        "project": project_id,
        "target": "production",
        "meta": {"sourceCommit": commit},
        "projectSettings": {
            key: config[key]
            for key in ("framework", "installCommand", "buildCommand", "outputDirectory")
        },
        "files": files,
    },
    sys.stdout,
    separators=(",", ":"),
)
