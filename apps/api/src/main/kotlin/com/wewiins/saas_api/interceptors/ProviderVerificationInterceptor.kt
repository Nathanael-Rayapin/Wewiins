package com.wewiins.saas_api.interceptors

import com.wewiins.saas_api.services.AccountService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.slf4j.LoggerFactory

@Component
class ProviderVerificationInterceptor(
    private val accountService: AccountService
): HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(ProviderVerificationInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val email = request.getParameter("email") ?: run {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email parameter required")
            return false
        }

        val verifiedAccount = accountService.getProviderVerifiedAccount(email)

        if (verifiedAccount == null) {
            logger.warn("Provider account not found for email: $email")
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Provider account not found")
            return false
        }

        if (!verifiedAccount.is_verified) {
            logger.warn("Provider not verified for email: $email")
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Provider not verified")
            return false
        }

        // It is stored in the HttpServletRequest object, which exists only for the duration of a single HTTP request.
        // Each request has its own independent request object.
        request.setAttribute("verifiedAccount", verifiedAccount)
        logger.info("Provider verified - Proceeding with request")

        return true
    }
}