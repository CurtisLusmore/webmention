Param(
    [string] $SubscriptionId,
    [string] $Location,
    [string] $Rg,
    [string] $Sa,
    [string] $Fa,
    [string] $Domain,
    [string] $Hostname,
    [switch] $LoginRequired
)

if ($LoginRequired)
{
    az login
}

if (-not $SubscriptionId)
{
    az account list --output table
    $SubscriptionId = Read-Host "Subscription ID"
}

az account set --subscription $SubscriptionId

if (-not $Location)
{
    az account list-locations --output table
    $Location = Read-Host "Location Name"
}

if (-not $Rg)
{
    Write-Host "Resource group names only allow alphanumeric characters, periods, underscores, hyphens and parenthesis and cannot end in a period."
    $Rg = Read-Host "Resource Group Name"
}

az group create `
    --location $Location `
    --name $Rg

if (-not $Sa)
{
    Write-Host "Storage account names can contain only lowercase letters and numbers."
    $Sa = Read-Host "Storage Account Name"
}

az storage account create `
    --resource-group $Rg `
    --name $Sa `
    --location $Location `
    --sku Standard_LRS

if (-not $Fa)
{
    Write-Host "Function app names can contain only letters, numbers and hyphens."
    $Fa = Read-Host "Function App Name"
}

az functionapp create `
    --name $Fa `
    --resource-group $Rg `
    --storage-account $Sa `
    --runtime node `
    --consumption-plan-location $Location

if (-not $Hostname)
{
    $Hostname = Read-Host "Hostname for Webmentions"
}

az functionapp config appsettings set `
    --name $Fa `
    --resource-group $Rg `
    --settings FUNCTIONS_EXTENSION_VERSION='~3' WEBSITE_NODE_DEFAULT_VERSION='~12' Hostname=$Hostname

if (-not $Domain)
{
    $Domain = Read-Host "Domain for CORS"
}

az functionapp cors add `
    --name $Fa `
    --resource-group $Rg `
    --allowed-origins $Domain http://localhost:5000 http://localhost:8080

func azure functionapp publish $Fa
