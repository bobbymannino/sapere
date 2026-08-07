<script lang="ts">
  import { resolve } from "$app/paths";
  import Meta from "$lib/components/meta.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import CardDescription from "$lib/components/ui/card/card-description.svelte";
  import CardFooter from "$lib/components/ui/card/card-footer.svelte";
  import CardHeader from "$lib/components/ui/card/card-header.svelte";
  import CardTitle from "$lib/components/ui/card/card-title.svelte";
  import Card from "$lib/components/ui/card/card.svelte";
  import { formatDate, formatShortDateTime, toIsoDate } from "$lib/date-format";
  import { ClockIcon } from "$lib/icons";

  import { version } from "../../../../package.json";
  import type { PageProps } from "./$types";
  import Passkeys from "./passkeys.svelte";

  let { data }: PageProps = $props();

  let joinedAt = $derived(formatDate(data.session.user.createdAt));
  let joinedAtIso = $derived(toIsoDate(data.session.user.createdAt));

  const builtAt = new Date(__BUILD_DATE__);
</script>

<Meta title="Account" description="Manage your account details and passkeys." robots="noindex,nofollow" />

<div>
  <section class="flex-center p-5">
    <Card class="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your account details.</CardDescription>
      </CardHeader>

      <CardContent>
        <dl class="flex flex-col gap-4">
          <div class="grid gap-1">
            <dt class="text-muted-foreground text-sm">Email</dt>
            <dd class="font-medium">{data.session.user.email}</dd>
          </div>
          <div class="grid gap-1">
            <dt class="text-muted-foreground text-sm">Username</dt>
            <dd class="font-medium">{data.session.user.username}</dd>
          </div>
          <div class="grid gap-1">
            <dt class="text-muted-foreground text-sm">Joined at</dt>
            <dd class="font-medium">
              <time datetime={joinedAtIso}>{joinedAt}</time>
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter>
        <Button variant="outline" class="w-full" href={resolve("/(app)/account/audit")}>
          <ClockIcon />
          <span>Audit Logs</span>
        </Button>
      </CardFooter>
    </Card>
  </section>

  <section class="flex-center p-5 pbs-0">
    <Passkeys />
  </section>

  <section class="flex-center p-5 pbs-0">
    <small class="opacity-50">{formatShortDateTime(builtAt)} • v{version}</small>
  </section>
</div>
