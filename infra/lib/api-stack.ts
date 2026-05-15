import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { Tables } from "./database-stack";
import * as path from "path";

interface ApiStackProps extends cdk.StackProps {
  tables: Tables;
  userPool: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { tables, userPool } = props;

    const backendPath = path.join(__dirname, "../../backend");

    // Authorizer Cognito
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "SchoolAuthorizer",
      { cognitoUserPools: [userPool] }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "SchoolApi", {
      restApiName: "school-system-api",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const commonEnv = {
      USERS_TABLE: tables.users.tableName,
      STUDENTS_TABLE: tables.students.tableName,
      GUARDIANS_TABLE: tables.guardians.tableName,
      STUDENT_GUARDIANS_TABLE: tables.studentGuardians.tableName,
      TEACHERS_TABLE: tables.teachers.tableName,
      GRADES_TABLE: tables.grades.tableName,
      TEACHER_NOTES_TABLE: tables.teacherNotes.tableName,
      CLASS_SCHEDULE_TABLE: tables.classSchedule.tableName,
    };

    const authMethodOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // --- StudentManager ---
    const studentFn = new lambda.Function(this, "StudentManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.student_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.users.grantReadWriteData(studentFn);
    tables.students.grantReadWriteData(studentFn);
    tables.guardians.grantReadWriteData(studentFn);
    tables.studentGuardians.grantReadWriteData(studentFn);

    const students = api.root.addResource("students");
    students.addMethod("GET", new apigateway.LambdaIntegration(studentFn), authMethodOptions);
    students.addMethod("POST", new apigateway.LambdaIntegration(studentFn), authMethodOptions);
    const studentById = students.addResource("{id}");
    studentById.addMethod("GET", new apigateway.LambdaIntegration(studentFn), authMethodOptions);
    studentById.addMethod("DELETE", new apigateway.LambdaIntegration(studentFn), authMethodOptions);

    // --- GuardianManager ---
    const guardianFn = new lambda.Function(this, "GuardianManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.guardian_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.guardians.grantReadWriteData(guardianFn);
    tables.studentGuardians.grantReadWriteData(guardianFn);

    const guardians = api.root.addResource("guardians");
    guardians.addMethod("GET", new apigateway.LambdaIntegration(guardianFn), authMethodOptions);
    guardians.addMethod("POST", new apigateway.LambdaIntegration(guardianFn), authMethodOptions);
    const guardianById = guardians.addResource("{id}");
    guardianById.addMethod("DELETE", new apigateway.LambdaIntegration(guardianFn), authMethodOptions);

    // --- TeacherManager ---
    const teacherFn = new lambda.Function(this, "TeacherManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.teacher_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.users.grantReadWriteData(teacherFn);
    tables.teachers.grantReadWriteData(teacherFn);

    const teachers = api.root.addResource("teachers");
    teachers.addMethod("GET", new apigateway.LambdaIntegration(teacherFn), authMethodOptions);
    teachers.addMethod("POST", new apigateway.LambdaIntegration(teacherFn), authMethodOptions);
    const teacherById = teachers.addResource("{id}");
    teacherById.addMethod("DELETE", new apigateway.LambdaIntegration(teacherFn), authMethodOptions);

    // --- GradeManager ---
    const gradeFn = new lambda.Function(this, "GradeManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.grade_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.grades.grantReadWriteData(gradeFn);

    const grades = api.root.addResource("grades");
    grades.addMethod("GET", new apigateway.LambdaIntegration(gradeFn), authMethodOptions);
    grades.addMethod("POST", new apigateway.LambdaIntegration(gradeFn), authMethodOptions);

    // --- TeacherNotesManager ---
    const notesFn = new lambda.Function(this, "TeacherNotesManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.teacher_notes_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.teacherNotes.grantReadWriteData(notesFn);

    const teacherNotes = api.root.addResource("teacher-notes");
    teacherNotes.addMethod("GET", new apigateway.LambdaIntegration(notesFn), authMethodOptions);
    teacherNotes.addMethod("POST", new apigateway.LambdaIntegration(notesFn), authMethodOptions);

    // --- ScheduleManager ---
    const scheduleFn = new lambda.Function(this, "ScheduleManager", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.schedule_manager.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.classSchedule.grantReadData(scheduleFn);

    const schedule = api.root.addResource("schedule");
    schedule.addMethod("GET", new apigateway.LambdaIntegration(scheduleFn), authMethodOptions);

    // --- DashboardService ---
    const dashboardFn = new lambda.Function(this, "DashboardService", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handlers.dashboard_service.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: commonEnv,
      timeout: cdk.Duration.seconds(30),
    });
    tables.students.grantReadData(dashboardFn);
    tables.teachers.grantReadData(dashboardFn);
    tables.grades.grantReadData(dashboardFn);

    const dashboard = api.root.addResource("dashboard");
    dashboard.addMethod("GET", new apigateway.LambdaIntegration(dashboardFn), authMethodOptions);

    // Output
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      exportName: "SchoolSystemApiUrl",
    });
  }
}
