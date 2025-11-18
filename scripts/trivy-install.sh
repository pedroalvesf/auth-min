#!/bin/bash

# Trivy installation script for different environments
# Supports Linux, macOS, and CI environments

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apk &> /dev/null; then
            echo "alpine"
        elif command -v apt-get &> /dev/null; then
            echo "ubuntu"
        elif command -v yum &> /dev/null; then
            echo "rhel"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to install Trivy on Alpine Linux (for CI environments)
install_trivy_alpine() {
    print_status "Installing Trivy on Alpine Linux..."
    apk add --no-cache wget
    
    TRIVY_VERSION="0.45.1"
    wget -qO - https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz | tar -xzf -
    mv trivy /usr/local/bin/
    chmod +x /usr/local/bin/trivy
}

# Function to install Trivy on Ubuntu/Debian
install_trivy_ubuntu() {
    print_status "Installing Trivy on Ubuntu/Debian..."
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
    sudo apt-get update && sudo apt-get install -y trivy
}

# Function to install Trivy on RHEL/CentOS/Fedora
install_trivy_rhel() {
    print_status "Installing Trivy on RHEL/CentOS/Fedora..."
    sudo tee /etc/yum.repos.d/trivy.repo << 'EOF'
[trivy]
name=Trivy repository
baseurl=https://aquasecurity.github.io/trivy-repo/rpm/releases/$basearch/
gpgcheck=1
gpgkey=https://aquasecurity.github.io/trivy-repo/rpm/public.key
enabled=1
EOF
    sudo yum install -y trivy
}

# Function to install Trivy on macOS
install_trivy_macos() {
    print_status "Installing Trivy on macOS..."
    if command -v brew &> /dev/null; then
        brew install aquasecurity/trivy/trivy
    else
        print_error "Homebrew not found. Please install Homebrew first or install Trivy manually."
        exit 1
    fi
}

# Function to verify Trivy installation
verify_trivy() {
    print_status "Verifying Trivy installation..."
    if command -v trivy &> /dev/null; then
        TRIVY_VERSION=$(trivy version | head -n1 | cut -d' ' -f2)
        print_success "Trivy ${TRIVY_VERSION} installed successfully"
        
        # Update database
        print_status "Updating Trivy vulnerability database..."
        trivy image --download-db-only
        print_success "Trivy database updated"
        
        return 0
    else
        print_error "Trivy installation failed"
        return 1
    fi
}

# Main installation function
main() {
    print_status "Starting Trivy installation..."
    
    # Check if Trivy is already installed
    if command -v trivy &> /dev/null; then
        CURRENT_VERSION=$(trivy version | head -n1 | cut -d' ' -f2)
        print_warning "Trivy ${CURRENT_VERSION} is already installed"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Skipping installation"
            verify_trivy
            exit 0
        fi
    fi
    
    OS=$(detect_os)
    print_status "Detected OS: $OS"
    
    case $OS in
        alpine)
            install_trivy_alpine
            ;;
        ubuntu)
            install_trivy_ubuntu
            ;;
        rhel)
            install_trivy_rhel
            ;;
        macos)
            install_trivy_macos
            ;;
        *)
            print_error "Unsupported OS: $OS"
            print_error "Please install Trivy manually: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
            exit 1
            ;;
    esac
    
    verify_trivy
}

# Show usage if help is requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    cat << EOF
Trivy Installation Script

This script automatically detects your operating system and installs Trivy
using the appropriate package manager or installation method.

Supported platforms:
- Alpine Linux (for CI environments)
- Ubuntu/Debian
- RHEL/CentOS/Fedora
- macOS (with Homebrew)

Usage:
    $0              # Install Trivy automatically
    $0 --help       # Show this help message

For manual installation instructions, visit:
https://aquasecurity.github.io/trivy/latest/getting-started/installation/
EOF
    exit 0
fi

# Run main function
main