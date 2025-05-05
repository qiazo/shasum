import { cac } from "cac";
import chalk from "chalk";
import { consola } from "consola";
import { shasum, verify, writeToFile, readFromFile } from "./main";
import * as pkgInfo from "../package.json";

// global options
interface GlobalCLIOptions {
  "--"?: string[];
  algorithm?: string;
}

try {
  const cli = cac("shasum");

  cli
    .command("create <entry> [...files]", "Compute SHA256 message digest.")
    .option(
      "--algorithm <algorithm>",
      "The `algorithm` is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` will display the available digest algorithms. (default: sha256) ",
      { default: "sha256" },
    )
    .action(
      async (entry: string, files: string[], options: GlobalCLIOptions) => {
        consola.debug("files: ", files, "options: ", options);

        try {
          const shasumContent = await shasum(files, options.algorithm);
          consola.warn(chalk.hex("#FFA500")(shasumContent));
          writeToFile(entry, shasumContent);
          consola.success(chalk.green("Saved successfully"));
        } catch (error) {
          consola.error(chalk.red(error));
          process.exit(1);
        }
      },
    );

  cli
    .command("verify <entry> [...files]", "Check SHA256 message digest.")
    .option(
      "--algorithm <algorithm>",
      "The `algorithm` is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` will display the available digest algorithms. (default: sha256) ",
      { default: "sha256" },
    )
    .action(
      async (entry: string, files: string[], options: GlobalCLIOptions) => {
        consola.debug("entry: ", entry, "files: ", files, "options: ", options);

        try {
          const dataFromFile = readFromFile(entry);
          const shasumVerified = await verify(
            files,
            dataFromFile,
            options.algorithm,
          );
          consola.success(chalk.green(shasumVerified));
        } catch (error) {
          consola.error(chalk.red(error));
          process.exit(1);
        }
      },
    );

  cli.help();
  cli.version(pkgInfo.version);

  cli.parse();
} catch (error) {
  consola.error(chalk.red(error));
  process.exit(1);
}
