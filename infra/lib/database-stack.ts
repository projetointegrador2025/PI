import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface Tables {
  users: dynamodb.Table;
  students: dynamodb.Table;
  guardians: dynamodb.Table;
  studentGuardians: dynamodb.Table;
  teachers: dynamodb.Table;
  grades: dynamodb.Table;
  teacherNotes: dynamodb.Table;
  classSchedule: dynamodb.Table;
}

export class DatabaseStack extends cdk.Stack {
  public readonly tables: Tables;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const users = new dynamodb.Table(this, "UsersTable", {
      tableName: "school-system-users",
      partitionKey: { name: "user_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const students = new dynamodb.Table(this, "StudentsTable", {
      tableName: "school-system-students",
      partitionKey: { name: "student_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const guardians = new dynamodb.Table(this, "GuardiansTable", {
      tableName: "school-system-guardians",
      partitionKey: { name: "guardian_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const studentGuardians = new dynamodb.Table(this, "StudentGuardiansTable", {
      tableName: "school-system-student-guardians",
      partitionKey: { name: "student_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "guardian_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const teachers = new dynamodb.Table(this, "TeachersTable", {
      tableName: "school-system-teachers",
      partitionKey: { name: "teacher_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const grades = new dynamodb.Table(this, "GradesTable", {
      tableName: "school-system-grades",
      partitionKey: { name: "student_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "subject_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const teacherNotes = new dynamodb.Table(this, "TeacherNotesTable", {
      tableName: "school-system-teacher-notes",
      partitionKey: { name: "student_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "note_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const classSchedule = new dynamodb.Table(this, "ClassScheduleTable", {
      tableName: "school-system-class-schedule",
      partitionKey: { name: "class_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "day_time", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.tables = {
      users,
      students,
      guardians,
      studentGuardians,
      teachers,
      grades,
      teacherNotes,
      classSchedule,
    };
  }
}
