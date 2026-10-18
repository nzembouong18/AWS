output "vpc_id" { value = aws_vpc.main.id }
output "public_subnets" { value = aws_subnet.public[*].id }
output "private_subnets" { value = aws_subnet.private[*].id }
output "data_subnets" { value = aws_subnet.data[*].id }
output "test_instance" { value = aws_instance.test.id }
output "ssm_connect" {
  value = "aws ssm start-session --target ${aws_instance.test.id}"
}
