import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "SchoolUserPool", {
      userPoolName: "school-system-user-pool",
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Grupos de usuários
    new cognito.CfnUserPoolGroup(this, "AdminGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "Admin",
      description: "Administradores do sistema",
    });

    new cognito.CfnUserPoolGroup(this, "TeacherGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "Teacher",
      description: "Professores",
    });

    new cognito.CfnUserPoolGroup(this, "StudentGroup", {
      userPoolId: this.userPool.userPoolId,
      groupName: "Student",
      description: "Alunos",
    });

    this.userPoolClient = this.userPool.addClient("SchoolAppClient", {
      userPoolClientName: "school-system-web-client",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      exportName: "SchoolSystemUserPoolId",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      exportName: "SchoolSystemUserPoolClientId",
    });
  }
}
