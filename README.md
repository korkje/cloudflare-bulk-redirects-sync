# cloudflare-bulk-redirect-sync

Parses [bulk redirect files](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/) and syncs them to your account via the Cloudflare API. You still need to create a [bulk redirect rule](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/) to apply the list.

Matched file names will be used as list names, sanitized to only contain lowercase letters, numbers and underscores.

## Inputs

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `api-token` | yes | | Cloudflare API token |
| `account-id` | yes | | Cloudflare account ID |
| `glob` | no | `./*.csv` | Glob for CSV files |

## Usage

```yaml
- uses: actions/checkout@v4
- uses: korkje/cloudflare-bulk-redirect-sync@<latest-version-tag>
  with:
    api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```