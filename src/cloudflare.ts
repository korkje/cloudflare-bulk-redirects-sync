const BASE = "https://api.cloudflare.com/client/v4";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CloudflareClient {
    constructor(private readonly accountId: string, private readonly token: string) {}

    private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
        const response = await fetch(`${BASE}/accounts/${this.accountId}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const payload = await response.json() as {
            success: boolean;
            result: T;
            errors?: { message: string }[];
        };

        if (!response.ok || !payload.success) {
            throw new Error(payload.errors?.map(_ => _.message).join("; ") ?? response.statusText);
        }

        return payload.result;
    }

    private async putList(listName: string): Promise<string> {
        const lists = await this.req<{ id: string; name: string }[]>(
            "GET",
            `/rules/lists?kind=redirect`,
        );

        const existing = lists.find(_ => _.name === listName);

        if (existing) {
            return existing.id;
        }

        const { id } = await this.req<{ id: string }>("POST", `/rules/lists`, {
            name: listName,
            kind: "redirect",
        });

        return id;
    }

    private async waitForOperation(operationId: string): Promise<void> {
        const deadline = Date.now() + 5 * 60 * 1000;

        while (Date.now() < deadline) {
            const { status } = await this.req<{ status: string }>(
                "GET",
                `/rules/lists/bulk_operations/${operationId}`,
            );

            if (status === "completed") return;
            if (status === "failed") throw new Error("List item update failed");

            await sleep(2000);
        }

        throw new Error("List item update timed out");
    }

    async put(listName: string, items: { redirect: Record<string, unknown> }[]): Promise<void> {
        const listId = await this.putList(listName);
        const { operation_id } = await this.req<{ operation_id: string }>(
            "PUT",
            `/rules/lists/${listId}/items`,
            items,
        );

        await this.waitForOperation(operation_id);
    }
}
