import { Stack, type StackProps } from "aws-cdk-lib";
import {
    ManagedPolicy,
    OpenIdConnectProvider,
    Role,
    WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export class GithubOidcStack extends Stack {
    readonly provider: OpenIdConnectProvider;
    readonly role: Role;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const issuer = "token.actions.githubusercontent.com";
        this.provider = new OpenIdConnectProvider(
            this,
            "GitHubIdentityProvider",
            {
                url: `https://${issuer}`,
                clientIds: ["sts.amazonaws.com"],
            },
        );
        this.role = new Role(this, "BootstrapRole", {
            assumedBy: new WebIdentityPrincipal(
                this.provider.openIdConnectProviderArn,
                {
                    StringLike: {
                        [`${issuer}:sub`]: "repo:joaonmatos/github-oicd:*",
                    },
                    StringEquals: {
                        [`${issuer}:aud`]: "sts.amazonaws.com",
                    },
                },
            ),
            roleName: "GitHubOicdBootstrapAppRole",
        });
        this.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName(
                "AWSCloudFormationFullAccess",
            ),
        );
        this.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        );
        this.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMFullAccess"),
        );
        this.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName(
                "AmazonElasticContainerRegistryPublicFullAccess",
            ),
        );
        this.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName("IAMFullAccess"),
        );
    }
}
