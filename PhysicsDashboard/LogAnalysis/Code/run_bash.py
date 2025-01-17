import subprocess

def call_bash_script(script_name, arg1, arg2, arg3, arg4):
    try:
        subprocess.run([f"./{script_name}.sh", arg1, arg2, arg3, arg4], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")