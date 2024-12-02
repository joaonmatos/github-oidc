import { Stack, type StackProps } from "aws-cdk-lib";
import {
    OpenIdConnectProvider,
    Policy,
    PolicyDocument,
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

        const policyJson = {
            Version: "2012-10-17",
            Statement: [
                {
                    Condition: {
                        "ForAnyValue:StringEquals": {
                            "iam:ResourceTag/aws-cdk:bootstrap-role": [
                                "deploy",
                                "lookup",
                                "file-publishing",
                                "image-publishing",
                            ],
                        },
                    },
                    Action: "sts:AssumeRole",
                    Resource: "*",
                    Effect: "Allow",
                },
                {
                    Action: "ecr:GetAuthorizationToken",
                    Effect: "Allow",
                    Resource: "*",
                },
            ],
        };

        new Policy(this, "CdkRolePolicy", {
            document: PolicyDocument.fromJson(policyJson),
            roles: [this.role],
        });
    }
}
