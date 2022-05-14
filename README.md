
### Working with dev envr.
```
conda create -n lab-csp-storage --override-channels --strict-channel-priority -c conda-forge -c nodefaults jupyterlab=3 cookiecutter nodejs jupyter-packaging git

conda activate lab-csp-storage

python -m pip install -e . && jupyter labextension develop . --overwrite && jupyter server extension enable csp_storage && jlpm run build

jupyter lab

// In a new terminal with same conda envr, for non python backend, frontend dev without manual rebuild
jlpm run watch

conda deactivate
```

### Build wheel package for install
```
pip install build

python -m build
```

### Test wheel package
```
conda create -n lab-testenv jupyterlab

conda activate lab-testenv

pip install csp_storage-0.1.0-py3-none-any.whl
jupyter server extension enable csp_storage

jupyter lab

pip install csp_storage-0.1.0-py3-none-any.whl
conda deactivate
```