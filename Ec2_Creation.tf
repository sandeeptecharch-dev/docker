# Configure AWS Provider
provider "aws" {
  region = "ap-south-1" # You can change it to your preferred region
}

resource "aws_instance" "pathnex" {
  ami                    = "ami-0f559c3642608c138"
  instance_type          = "m7i-flex.large" # You can change it according to your need
  count                  = 1
  key_name               = "Pathnex-ec2-key" # change if key name is different in aws account
  subnet_id              = "subnet-060e30fbb2ffaa858" # Change it with your subnet id
  vpc_security_group_ids = ["sg-006c76c984d9e1310"] # Change it with your security group
  tags = {
    Name = "pathnex-ec2"
  }
}

output "ec2_public_ips" {
  value = aws_instance.pathnex[*].public_ip
}