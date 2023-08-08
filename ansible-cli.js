const { Vault } = require("ansible-vault")
const { config } = require("dotenv")
const fs = require("fs") //
async function Anisable() {
	let argvLength = process.argv.length
	let cli = process.argv.slice(2, argvLength)

	// set the environment file path
	let configFile = ".env.dev"
	config({
		path: configFile,
	})
	try {
		// check if config file exists
		if (fs.existsSync(configFile)) {
			// check for the missing arguments
			if (!cli.length || cli.length < 2) {
				throw new Error(
					"arguments: {encrypt||decrypt} [filepath] are missing"
				)
			} else if (cli.includes(configFile)) {
				throw new Error(
					"you can't encrypt  or decrypt the config file"
				)
			} else {
				let [command, path] = cli

				switch (command) {
					case "encrypt":
						await Run(path)
						break
					case "decrypt":
						await Run(path, false)
						break
					default:
						throw new Error(
							`command not supported: ${command}`
						)
				}
			}
			//
		} else {
			throw new Error(`config file ${configFile} does not exist`)
		}
	} catch (err) {
		console.error(err.message)
	}
}

async function Run(path, encrypt = true) {
	// read the target file
	const vaultKey = process.env.VAULT_KEY
	if (!vaultKey) {
		throw new Error(
			"Missing environment variable VAULT_KEY in your config file"
		)
	}
	// read the
	const v = new Vault({ password: vaultKey })
	let fileString = await fs.promises.readFile(path, { encoding: "utf8" })

	const isEncrypted = fileString.includes("$ANSIBLE_VAULT;1.1;AES256")
	//console.log("file is encrypted: " + isEncrypted)
	let result
	if (encrypt) {
		// only encrypt once;
		if (!isEncrypted) {
			result = await v.encrypt(fileString)
			await updateFile(path, result)
		}
	} else {
		//
		if (isEncrypted) {
			result = await v.decrypt(fileString)
			await updateFile(path, result)
		} else {
			console.log("file is not encrypted, so no decryption is done")
		}
	}
}

async function updateFile(path, content) {
	path = ".encrypted"

	// delete the original file
	// create a new file name encrypted;
	if (fs.existsSync(path)) {
		await fs.promises.unlink(path)
		// create a new file name encrypted;
	} else {
		// do nothing
	}
	await fs.promises.appendFile(path, content, { encoding: "utf-8" })
	// write a new file with content;

	//await fs.promises.writeFile(path, content, { encoding: "utf8" });

	console.log("task complete, check file: " + path)
}

Anisable()
