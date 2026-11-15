const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  // Start server on an ephemeral random port for isolated testing
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Helper for making JSON HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

test('1. GET /api/dashboard/stats returns university dashboard counts and statistics', async () => {
  const res = await request('GET', '/api/dashboard/stats');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(typeof res.body.data.totalStudents === 'number');
  assert.ok(typeof res.body.data.totalAttendance === 'number');
  assert.ok(typeof res.body.data.overallPercentage === 'number');
  assert.ok(res.body.data.database);
});

test('2. GET /api/students returns list of students', async () => {
  const res = await request('GET', '/api/students');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test('3. POST /api/students registers a new student with validation', async () => {
  const newStudent = {
    rollNo: 'TEST_' + Date.now(),
    name: 'Test Student',
    course: 'B.Voc Software Development',
    semester: 5,
    email: `test.${Date.now()}@college.edu`
  };

  const res = await request('POST', '/api/students', newStudent);
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.rollNo, newStudent.rollNo);
  assert.equal(res.body.data.name, newStudent.name);

  // Duplicate registration should be rejected with 409 Conflict
  const dupRes = await request('POST', '/api/students', newStudent);
  assert.equal(dupRes.status, 409);
  assert.equal(dupRes.body.success, false);
});

test('4. GET /api/faculty returns list of faculty members', async () => {
  const res = await request('GET', '/api/faculty');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('5. POST /api/attendance marks attendance and prevents duplicate entry', async () => {
  // Use unique date and timestamp to ensure test is idempotent across test runs
  const randomSuffix = Math.floor(Math.random() * 899999 + 100000);
  const testDate = `2099-12-15`;
  const testSubject = `Test Subject ${randomSuffix}`;
  const testRoll = '24107030'; // Karan Kumar

  // First mark: Should succeed
  const markRes = await request('POST', '/api/attendance', {
    studentRollNo: testRoll,
    subject: testSubject,
    date: testDate,
    status: 'Present',
    markedBy: 'FAC101'
  });

  assert.equal(markRes.status, 201);
  assert.equal(markRes.body.success, true);
  assert.equal(markRes.body.data.studentRollNo, testRoll);
  assert.equal(markRes.body.data.status, 'Present');

  // Second mark on same date & subject: Should be rejected as duplicate
  const dupMarkRes = await request('POST', '/api/attendance', {
    studentRollNo: testRoll,
    subject: testSubject,
    date: testDate,
    status: 'Absent',
    markedBy: 'FAC101'
  });

  assert.equal(dupMarkRes.status, 409);
  assert.equal(dupMarkRes.body.success, false);
  assert.ok(dupMarkRes.body.message.includes('Duplicate Attendance'));
});

test('6. GET /api/attendance/summary calculates student attendance percentages correctly', async () => {
  const res = await request('GET', '/api/attendance/summary');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));

  const karan = res.body.data.find(s => s.rollNo === '24107030');
  assert.ok(karan);
  assert.ok(karan.totalClasses >= 4);
  assert.ok(typeof karan.percentage === 'number');
  assert.ok(karan.percentage >= 0 && karan.percentage <= 100);
});

test('7. GET /api/attendance/logs retrieves audit logs from Node.js fs module', async () => {
  const res = await request('GET', '/api/attendance/logs');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
  assert.ok(res.body.data[0].includes('ROLL:'));
});
