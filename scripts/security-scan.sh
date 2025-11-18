#!/bin/bash

# Security scanning script for auth-min project
# This script runs various security checks including Trivy scans

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SCAN_TYPE="all"
IMAGE_NAME="auth-min"
IMAGE_TAG="latest"
OUTPUT_FORMAT="table"
SEVERITY="HIGH,CRITICAL"
EXIT_ON_VULN=true

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Security Scanning Script for auth-min

Usage: $0 [OPTIONS]

OPTIONS:
    -t, --type TYPE         Scan type: all, filesystem, image, secrets (default: all)
    -i, --image IMAGE       Docker image name (default: auth-min)
    -T, --tag TAG          Docker image tag (default: latest)
    -f, --format FORMAT    Output format: table, json, sarif (default: table)
    -s, --severity LEVEL   Severity levels: LOW,MEDIUM,HIGH,CRITICAL (default: HIGH,CRITICAL)
    --no-exit              Don't exit on vulnerabilities found
    -h, --help             Show this help message

EXAMPLES:
    $0                                          # Run all scans
    $0 -t filesystem                           # Scan only filesystem
    $0 -t image -i auth-min:v1.0.0            # Scan specific image
    $0 -f json -s HIGH,CRITICAL               # Output JSON with high/critical only
EOF
}

# Function to check if Trivy is installed
check_trivy() {
    if ! command -v trivy &> /dev/null; then
        print_error "Trivy is not installed. Installing..."
        if command -v brew &> /dev/null; then
            brew install aquasecurity/trivy/trivy
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg lsb-release
            wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
            echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
            sudo apt-get update && sudo apt-get install -y trivy
        else
            print_error "Please install Trivy manually: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
            exit 1
        fi
    fi
}

# Function to run filesystem scan
run_filesystem_scan() {
    print_status "Running Trivy filesystem scan..."
    
    local exit_code_arg=""
    if [ "$EXIT_ON_VULN" = true ]; then
        exit_code_arg="--exit-code 1"
    fi
    
    trivy fs \
        --config ./security/trivy-config.yaml \
        --format "$OUTPUT_FORMAT" \
        --severity "$SEVERITY" \
        $exit_code_arg \
        --cache-dir ./.trivy-cache \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Filesystem scan completed successfully"
    else
        print_warning "Filesystem scan found vulnerabilities"
    fi
}

# Function to run image scan
run_image_scan() {
    local full_image="${IMAGE_NAME}:${IMAGE_TAG}"
    print_status "Running Trivy image scan for $full_image..."
    
    # Check if image exists
    if ! docker image inspect "$full_image" &> /dev/null; then
        print_error "Docker image $full_image not found. Please build the image first."
        return 1
    fi
    
    local exit_code_arg=""
    if [ "$EXIT_ON_VULN" = true ]; then
        exit_code_arg="--exit-code 1"
    fi
    
    trivy image \
        --config ./security/trivy-config.yaml \
        --format "$OUTPUT_FORMAT" \
        --severity "$SEVERITY" \
        $exit_code_arg \
        --cache-dir ./.trivy-cache \
        "$full_image"
    
    if [ $? -eq 0 ]; then
        print_success "Image scan completed successfully"
    else
        print_warning "Image scan found vulnerabilities"
    fi
}

# Function to run secret scan
run_secret_scan() {
    print_status "Running Trivy secret scan..."
    
    trivy fs \
        --scanners secret \
        --format "$OUTPUT_FORMAT" \
        --cache-dir ./.trivy-cache \
        .
    
    if [ $? -eq 0 ]; then
        print_success "Secret scan completed successfully"
    else
        print_warning "Secret scan found issues"
    fi
}

# Function to run NPM audit
run_npm_audit() {
    print_status "Running NPM security audit..."
    
    if [ ! -f "package.json" ]; then
        print_warning "No package.json found, skipping NPM audit"
        return 0
    fi
    
    if npm audit --audit-level high --production; then
        print_success "NPM audit completed successfully"
    else
        print_warning "NPM audit found vulnerabilities"
        npm audit --audit-level high --production || true
    fi
}

# Function to check Prisma schema
check_prisma_schema() {
    print_status "Checking Prisma schema formatting..."
    
    if [ ! -f "prisma/schema.prisma" ]; then
        print_warning "No Prisma schema found, skipping check"
        return 0
    fi
    
    if npx prisma format --schema=./prisma/schema.prisma --check; then
        print_success "Prisma schema is properly formatted"
    else
        print_warning "Prisma schema formatting issues found"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            SCAN_TYPE="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -T|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -s|--severity)
            SEVERITY="$2"
            shift 2
            ;;
        --no-exit)
            EXIT_ON_VULN=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting security scan for auth-min project"
    print_status "Scan type: $SCAN_TYPE"
    print_status "Output format: $OUTPUT_FORMAT"
    print_status "Severity levels: $SEVERITY"
    
    # Create cache directory
    mkdir -p ./.trivy-cache
    
    # Check dependencies
    check_trivy
    
    case $SCAN_TYPE in
        "all")
            run_filesystem_scan
            run_image_scan
            run_secret_scan
            run_npm_audit
            check_prisma_schema
            ;;
        "filesystem")
            run_filesystem_scan
            ;;
        "image")
            run_image_scan
            ;;
        "secrets")
            run_secret_scan
            ;;
        *)
            print_error "Unknown scan type: $SCAN_TYPE"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Security scan completed"
}

# Run main function
main