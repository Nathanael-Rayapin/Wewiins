package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.repositories.AccountRepository
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service

@Service
class AccountService(private val accountRepository: AccountRepository) {

    fun getProviderVerifiedAccount(email: String): VerifiedAccountDto? {
        return runBlocking {
            accountRepository.getProviderVerifiedAccount(email)
        }
    }
}