import { setupTelemetry } from './infrastructure/telemetry.js';

// Initialize Application Insights when the function app starts
setupTelemetry();

console.log('🚀 Device Catalogue Service started');
