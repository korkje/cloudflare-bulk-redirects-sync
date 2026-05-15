import { expandGlob } from "jsr:@std/fs@1/expand-glob";
import { CloudflareClient } from "./cloudflare.ts";
import { convert } from "./csv.ts";

const glob = Deno.env.get("INPUT_GLOB")!;
const root = Deno.env.get("GITHUB_WORKSPACE") ?? Deno.cwd();
const files = await Array.fromAsync(expandGlob(glob, { root, includeDirs: false }));

const apiToken = Deno.env.get("INPUT_API_TOKEN")!;
const accountId = Deno.env.get("INPUT_ACCOUNT_ID")!;
const client = new CloudflareClient(accountId, apiToken);

for (const { path, name } of files) {
    await client.put(
        name.replace(/[^a-z0-9_]/g, "_").toLowerCase(),
        convert(await Deno.readTextFile(path)),
    );
}
