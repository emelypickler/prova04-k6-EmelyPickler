import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getRequestDuration = new Trend('get_request_duration', true);
export const rateStatusOk = new Rate('rate_status_ok');

export const options = {
  thresholds: {
    http_req_duration: ['p(90)<6800'],
    get_request_duration: ['p(90)<6800'],
    http_req_failed: ['rate<0.25'],
    rate_status_ok: ['rate>0.75']
  },

  stages: [
    { duration: '30s', target: 7 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 35 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 65 },
    { duration: '30s', target: 80 },
    { duration: '30s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const url = 'https://dummyjson.com/products/1';

  const res = http.get(url);

  getRequestDuration.add(res.timings.duration);
  rateStatusOk.add(res.status === 200);

  check(res, {
    'Status 200 OK': () => res.status === 200,
    'Response tem campo title': () => {
      try {
        const body = JSON.parse(res.body);
        return Boolean(body.title);
      } catch (e) {
        return false;
      }
    }
  });
}
