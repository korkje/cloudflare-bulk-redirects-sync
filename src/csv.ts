import { parse } from "jsr:@std/csv@1/parse";

const fromString = (value: string) => String(value).trim();
const fromNumber = (value: string) => Number(String(value).trim());
const fromBoolean = (value: string) => Boolean(String(value).trim().toLowerCase() === "true");

const FIELDS: [string, (value: string) => unknown][] = [
    ["source_url", fromString],
    ["target_url", fromString],
    ["status_code", fromNumber],
    ["preserve_query_string", fromBoolean],
    ["include_subdomains", fromBoolean],
    ["subpath_matching", fromBoolean],
    ["preserve_path_suffix", fromBoolean],
];

export const convert = (content: string) =>
    parse(content, { comment: "#" }).map(row => ({
        "redirect": Object.fromEntries(
            FIELDS.map(([field, ctor], i) => [field, row[i] ? ctor(row[i]) : undefined])
        ),
    }));
