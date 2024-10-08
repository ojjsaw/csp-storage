### 1 time setup
```
wget https://repo.anaconda.com/miniconda/Miniconda3-py38_4.12.0-Linux-x86_64.sh
bash Miniconda3-py38_4.12.0-Linux-x86_64.sh
conda config --set auto_activate_base false //to prevent remote vscode issue
```

### Working with dev envr.
```
conda create -n lab-csp-storage --override-channels --strict-channel-priority -c conda-forge -c nodefaults jupyterlab=3 cookiecutter nodejs jupyter-packaging git

conda activate lab-csp-storage

python -m pip install -e . && jupyter labextension develop . --overwrite && jupyter server extension enable csp_storage && jlpm run build

pip install numpy boto3

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

jupyter server extension disable csp_storage
pip uninstall csp_storage-0.1.0-py3-none-any.whl
conda deactivate
```
