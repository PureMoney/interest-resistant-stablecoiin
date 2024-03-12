# interest-resistant-stablecoiin

This a set of Solana contracts written in solang that implement an inflation-resistant stablecoin using OpenBook. It is submitted as an entry to the Renaissance Hackathon run by Colosseum.

# For dev contributors

If you are new to Solana, it helps to read a good intro: [Link](https://www.helius.dev/blog/the-solana-programming-model-an-introduction-to-developing-on-solana)

Programming directly on Solana involves lots of complicated details. Using the Anchor library helps simplify things like figuring out the instructions that form a transaction. Here is a good documentation on Anchor: [Link](https://book.anchor-lang.com/)

We come from the Microsoft side of the programming fence, but the tools necessary for building a Solana app are all native to Linux. In order to make things simpler and less risky we decided to use Linux for our workstation; however, we kept Windows as part of our environment, but only for its great UI and VS Code. The Windows Subsystem for Linux has been crucial in allowing us to use Linux CLI tools and yet use VS Code for editing and debugging. However, using Linux alone should work too.

We decided against using Rust mainly for the same reason: we come from Microsoft. We want to use Anchor but not Rust, so at first we thought C or C++ would be good. Alas, C / C++ does not have a good externals file (dot h file) for Anchor. We finally decided to use solang; solang is simple (not much clutter) and the resulting contracts can link with Anchor. Besides, we've done a lot of EVM Solidity programming and solang looks and feels like Solidity (but for Solana).

Here is a great intro on how to use solang in the Solana environment: [Link](https://solidityonsolana.one/CourseContent)

Here is some documentation on using solang with some info on how to use Anchor: [Link](https://solang.readthedocs.io/en/v0.3.3/targets/solana.html)

# How to install the tools in your Linux workstation

## Installing Cargo and Anchor

```shell
# Using Ubuntu WSL

# Cargo installation
sudo apt install cargo

# Anchor installation
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Below is optional if cargo install fails
sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev

# Install the latest version of the CLI using avm and set to latest
avm install latest
avm use latest
```

Verify installation by:

```shell
anchor --version
```

Source: [here](https://www.anchor-lang.com/docs/installation)

Use [VS Code](https://code.visualstudio.com/docs/remote/wsl-tutorial) for coding.

Set `PATH` to

```bash
/home/<user>/.local/share/solana/install/active_release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/home/<user>/.cargo/bin
```

```shell
avm --version
```

Anchor is installed at this point

```shell
anchor init hello-world
```

this prepares files for Rust - not what we need - but good enough to start somewhere

## To add anchor library to a project:

```shell
cargo add anchor-lang
cargo add anchor-spl
```

anchor ipl fetch <address>
solang ipl --output filename.txt some.ipl
![image](https://github.com/PureMoney/interest-resistant-stablecoiin/assets/2825510/6b1f3b4a-fb8f-4e28-853c-e5e1249947a9)

https://solang.readthedocs.io/en/latest/index.html
https://solang.readthedocs.io/en/latest/targets/solana.html

Installing Solang — Solang Solidity Compiler v0.3.3-38-g22d6217 documentation
Follow Option 2 - Download the binary
(click "Linux x86-64" which works in WSL Ubuntu)

mkdir ~/.local/share/solana/install/solang
mkdir ~/.local/share/solana/install/solang/bin
cp /mnt/c/Users/CarlosTapang/Downloads/solang-linux-x86-64 ~/.local/share/solana/install/solang/bin/solang
(Copy from your Download folder to ~/.local/share/solana/install/solang/bin/solang)
export PATH=/home/ctapang/.local/share/solana/install/active_release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:~/.local/share/solana/install/solang/bin/solang
solang --version
(Note: solang is also installed when solana sdk is installed.)

![image](https://github.com/PureMoney/interest-resistant-stablecoiin/assets/2825510/45316ee0-83d8-433d-bbd2-dd8ea2194f6d)
