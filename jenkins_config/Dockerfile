FROM jenkins/jenkins:lts

# Switch to root to install plugins and configure
USER root

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy plugins list and install
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Copy initial configuration
COPY jenkins.yaml /usr/share/jenkins/ref/jenkins.yaml
COPY secrets/ /usr/share/jenkins/ref/secrets/

# Set environment for configuration as code
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Switch back to jenkins user
USER jenkins
