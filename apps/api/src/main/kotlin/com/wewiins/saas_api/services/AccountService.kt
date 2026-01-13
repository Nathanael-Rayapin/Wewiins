package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.Account
import com.wewiins.saas_api.dto.VerifiedAccount
import com.wewiins.saas_api.repositories.AccountRepository
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service

@Service
class AccountService(private val accountRepository: AccountRepository) {

    fun getProviderVerifiedAccount(email: String): VerifiedAccount? {
        return runBlocking {
            accountRepository.getProviderVerifiedAccount(email)
        }
    }
}