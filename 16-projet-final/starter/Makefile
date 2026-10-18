.PHONY: fmt validate lint scan plan apply destroy

ENV ?= dev
DIR := infra/envs/$(ENV)

fmt:
	terraform -chdir=$(DIR) fmt -recursive ../..

validate:
	terraform -chdir=$(DIR) init -backend=false -input=false
	terraform -chdir=$(DIR) validate

lint:
	tflint --chdir=$(DIR)

scan:
	checkov -d infra --quiet

plan:
	terraform -chdir=$(DIR) plan -out=tfplan

apply:
	terraform -chdir=$(DIR) apply tfplan

destroy:
	terraform -chdir=$(DIR) destroy
