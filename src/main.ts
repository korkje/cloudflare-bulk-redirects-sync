import { expandGlob } from "jsr:@std/fs@1/expand-glob";
import { CloudflareClient } from "./cloudflare.ts";
import { convert } from "./csv.ts";

const glob = Deno.env.get("INPUT_GLOB")!;
const root = Deno.env.get("GITHUB_WORKSPACE") ?? Deno.cwd();
const files = await Array.fromAsync(expandGlob(glob, { root, includeDirs: false }));

console.log(`Found ${files.length} file(s) matching "${glob}"`);

const apiToken = Deno.env.get("INPUT_API_TOKEN")!;
const accountId = Deno.env.get("INPUT_ACCOUNT_ID")!;

if (!apiToken || !accountId) {
    console.error("API token and account ID are required");
    Deno.exit(1);
}

const client = new CloudflareClient(accountId, apiToken);

for (const { path, name } of files) {
    console.log(`${path.slice(root.length)}:`);

    const listName = name.replace(/[^a-z0-9_]/g, "_").toLowerCase();

    if (listName !== name) {
        console.log(`  "${name}" -> "${listName}"`);
    }

    await client.put(listName, convert(await Deno.readTextFile(path)));
}
