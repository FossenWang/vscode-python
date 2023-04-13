# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import os
import sys

PY36 = sys.version_info < (3, 7)


if __name__ == "__main__":
    # Launch diffrent version of debugpy according to python version.
    # Change `sys.path` to find debugpy package.
    if "debugpy" not in sys.modules:
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        python_dir = "python" if not PY36 else "python36"
        sys.path[0] = os.path.join(root, "lib", python_dir)

        import debugpy  # noqa

        del sys.path[0]

    from debugpy.adapter.__main__ import main, _parse_argv

    main(_parse_argv(sys.argv))
