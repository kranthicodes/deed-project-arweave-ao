LawyerAddress = LawyerAddress or ao.env.Process.Tags.LawyerAddress
BeneficiaryAddress = BeneficiaryAddress or ao.env.Process.Tags.BeneficiaryAddress
UnlockTime = UnlockTime or ao.env.Process.Tags.UnlockTime
Amount = Amount or ao.env.Process.Tags.Amount
TokenPID = TokenPID or ao.env.Process.Tags.TokenPID

---@type HandlerFunction
function Withdraw(msg)
  assert(msg.From == LawyerAddress, "Only the lawyer can withdraw")

  assert(msg.Timestamp >= UnlockTime, "The deed is not yet unlocked")

  ao.send({
    Target = TokenPID,
    Action = "Transfer",
    Quantity = Amount,
    Recipient = BeneficiaryAddress,
  })

  msg.reply({
    Action = "Withdraw-Response",
    Amount = Amount,
  })
end

Handlers.add("Withdraw", {
  ["Action"] = "Withdraw"
}, Withdraw)