#!/usr/bin/env node

/**
 * cli.js - Command-Line Interface for Student Attendance Management System
 * Built with Yargs for command-line argument parsing and Node.js fs module for audit logging.
 * 
 * Usage examples:
 *   node cli.js mark --roll=24107030 --subject="FSWD-II" --status=Present
 *   node cli.js add-student --roll=24107035 --name="Neha Gupta" --course="B.Voc SD" --semester=5 --email="neha@college.edu"
 *   node cli.js stats
 *   node cli.js stats --roll=24107030
 *   node cli.js list-students
 *   node cli.js logs
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const dotenv = require('dotenv');

dotenv.config();

const storage = require('./utils/storage');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');

async function main() {
  // Connect to DB if configured
  const connected = await connectDB();
  if (connected) {
    await storage.seedDatabaseIfEmpty();
  }

  yargs(hideBin(process.argv))
    .scriptName('cli')
    .usage('$0 <cmd> [args]')

    // Command 1: mark attendance
    .command(
      'mark',
      'Mark student attendance for a subject',
      (y) => {
        return y
          .option('roll', {
            alias: 'r',
            type: 'string',
            describe: 'Student Roll Number',
            demandOption: true
          })
          .option('subject', {
            alias: 's',
            type: 'string',
            describe: 'Subject name or code',
            demandOption: true
          })
          .option('status', {
            type: 'string',
            describe: 'Attendance status (Present or Absent)',
            choices: ['Present', 'Absent'],
            demandOption: true
          })
          .option('date', {
            alias: 'd',
            type: 'string',
            describe: 'Date in YYYY-MM-DD format (defaults to today)',
            default: new Date().toISOString().split('T')[0]
          })
          .option('markedBy', {
            alias: 'm',
            type: 'string',
            describe: 'Faculty identifier who marked the attendance',
            default: 'CLI_ADMIN'
          });
      },
      async (argv) => {
        try {
          console.log(`\n⏳ Marking attendance for Roll: ${argv.roll}...`);
          const record = await storage.markAttendance({
            studentRollNo: argv.roll,
            subject: argv.subject,
            date: argv.date,
            status: argv.status,
            markedBy: argv.markedBy
          });

          // Write to attendance.log via fs module
          await logger.logAttendance({
            rollNo: record.studentRollNo,
            studentName: record.studentName,
            subject: record.subject,
            date: record.date,
            status: record.status,
            markedBy: record.markedBy
          });

          console.log('\n========================================================');
          console.log('✅ ATTENDANCE MARKED SUCCESSFULLY');
          console.log('========================================================');
          console.log(`Student Name : ${record.studentName}`);
          console.log(`Roll Number  : ${record.studentRollNo}`);
          console.log(`Subject      : ${record.subject}`);
          console.log(`Date         : ${record.date}`);
          console.log(`Status       : ${record.status}`);
          console.log(`Marked By    : ${record.markedBy}`);
          console.log(`Audit Log    : Appended to logs/attendance.log`);
          console.log('========================================================\n');
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        } finally {
          process.exit(0);
        }
      }
    )

    // Command 2: add-student
    .command(
      'add-student',
      'Register a new student',
      (y) => {
        return y
          .option('roll', {
            alias: 'r',
            type: 'string',
            describe: 'Student Roll Number',
            demandOption: true
          })
          .option('name', {
            alias: 'n',
            type: 'string',
            describe: 'Student Full Name',
            demandOption: true
          })
          .option('course', {
            alias: 'c',
            type: 'string',
            describe: 'Course Name (e.g. B.Voc Software Development)',
            demandOption: true
          })
          .option('semester', {
            alias: 'sem',
            type: 'number',
            describe: 'Semester number (1-8)',
            demandOption: true
          })
          .option('email', {
            alias: 'e',
            type: 'string',
            describe: 'Student Email Address',
            demandOption: true
          });
      },
      async (argv) => {
        try {
          console.log(`\n⏳ Registering student: ${argv.name}...`);
          const student = await storage.createStudent({
            rollNo: argv.roll,
            name: argv.name,
            course: argv.course,
            semester: argv.semester,
            email: argv.email
          });

          console.log('\n========================================================');
          console.log('✅ STUDENT REGISTERED SUCCESSFULLY');
          console.log('========================================================');
          console.log(`Name     : ${student.name}`);
          console.log(`Roll No  : ${student.rollNo}`);
          console.log(`Course   : ${student.course}`);
          console.log(`Semester : ${student.semester}`);
          console.log(`Email    : ${student.email}`);
          console.log('========================================================\n');
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        } finally {
          process.exit(0);
        }
      }
    )

    // Command 3: stats
    .command(
      'stats',
      'Display attendance statistics',
      (y) => {
        return y.option('roll', {
          alias: 'r',
          type: 'string',
          describe: 'Filter statistics by student Roll Number (optional)'
        });
      },
      async (argv) => {
        try {
          if (argv.roll) {
            const student = await storage.findStudentByRoll(argv.roll);
            if (!student) {
              console.error(`\n❌ Student with Roll Number "${argv.roll}" not found.\n`);
              process.exit(1);
            }
            const records = await storage.getAttendanceRecords({ rollNo: argv.roll });
            const total = records.length;
            const present = records.filter(r => r.status === 'Present').length;
            const absent = total - present;
            const pct = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

            console.log('\n========================================================================');
            console.log(`📊 ATTENDANCE REPORT FOR: ${student.name.toUpperCase()} (${student.rollNo})`);
            console.log('========================================================================');
            console.log(`Course / Sem    : ${student.course} - Sem ${student.semester}`);
            console.log(`Total Classes   : ${total}`);
            console.log(`Present Classes : ${present}`);
            console.log(`Absent Classes  : ${absent}`);
            console.log(`Percentage      : ${pct}%`);
            console.log(`Eligibility     : ${Number(pct) >= 75 ? 'ELIGIBLE (>= 75%)' : 'ATTENDANCE SHORTAGE (< 75%)'}`);
            console.log('------------------------------------------------------------------------');
            console.log('Recent Records:');
            records.slice(0, 10).forEach((r, idx) => {
              console.log(`  ${idx + 1}. [${r.date}] ${r.subject.padEnd(30)} : ${r.status}`);
            });
            console.log('========================================================================\n');
          } else {
            const summary = await storage.getAttendanceSummary();
            const dash = await storage.getDashboardStats();

            console.log('\n========================================================================');
            console.log('📊 OVERALL UNIVERSITY ATTENDANCE SUMMARY');
            console.log('========================================================================');
            console.log(`Total Students Registered : ${dash.totalStudents}`);
            console.log(`Total Faculty Members     : ${dash.totalFaculty}`);
            console.log(`Total Attendance Records  : ${dash.totalAttendance}`);
            console.log(`Campus Attendance Rate    : ${dash.overallPercentage}%`);
            console.log('------------------------------------------------------------------------');
            console.log('ROLL NO'.padEnd(12) + 'NAME'.padEnd(20) + 'TOTAL'.padEnd(8) + 'PRESENT'.padEnd(10) + 'PERCENT'.padEnd(12) + 'STATUS');
            console.log('-'.repeat(72));
            summary.forEach(s => {
              const roll = s.rollNo.padEnd(12);
              const name = (s.name.length > 18 ? s.name.substring(0, 15) + '...' : s.name).padEnd(20);
              const tot = String(s.totalClasses).padEnd(8);
              const pres = String(s.presentClasses).padEnd(10);
              const pct = `${s.percentage}%`.padEnd(12);
              const status = s.eligibility;
              console.log(`${roll}${name}${tot}${pres}${pct}${status}`);
            });
            console.log('========================================================================\n');
          }
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        } finally {
          process.exit(0);
        }
      }
    )

    // Command 4: list-students
    .command(
      'list-students',
      'Display list of all enrolled students',
      {},
      async () => {
        try {
          const students = await storage.getAllStudents();
          console.log('\n================================================================================');
          console.log('🎓 ENROLLED STUDENTS DIRECTORY');
          console.log('================================================================================');
          console.log('ROLL NO'.padEnd(12) + 'NAME'.padEnd(20) + 'COURSE'.padEnd(28) + 'SEM'.padEnd(6) + 'EMAIL');
          console.log('-'.repeat(80));
          students.forEach(s => {
            const roll = s.rollNo.padEnd(12);
            const name = (s.name.length > 18 ? s.name.substring(0, 15) + '...' : s.name).padEnd(20);
            const crs = (s.course.length > 25 ? s.course.substring(0, 22) + '...' : s.course).padEnd(28);
            const sem = String(s.semester).padEnd(6);
            console.log(`${roll}${name}${crs}${sem}${s.email}`);
          });
          console.log('================================================================================\n');
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        } finally {
          process.exit(0);
        }
      }
    )

    // Command 5: logs
    .command(
      'logs',
      'View attendance audit logs from logs/attendance.log',
      (y) => {
        return y.option('limit', {
          alias: 'l',
          type: 'number',
          describe: 'Number of recent log lines to display',
          default: 20
        });
      },
      async (argv) => {
        try {
          const logs = logger.getRecentLogs(argv.limit);
          console.log('\n================================================================================');
          console.log(`📄 AUDIT LOGS (logs/attendance.log) - Showing last ${logs.length} entries`);
          console.log('================================================================================');
          if (logs.length === 0) {
            console.log('No log entries found yet.');
          } else {
            logs.forEach(line => console.log(line));
          }
          console.log('================================================================================\n');
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        } finally {
          process.exit(0);
        }
      }
    )

    .demandCommand(1, 'Please specify a valid command (e.g., mark, add-student, stats, list-students, logs)')
    .help()
    .argv;
}

main();
