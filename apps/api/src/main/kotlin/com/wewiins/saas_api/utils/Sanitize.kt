package com.wewiins.saas_api.utils

import java.text.Normalizer

class Sanitize {
    companion object {

        fun text(value: String): String {
            return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
                .lowercase()
                .replace(Regex("[@.]"), "_")
                .replace(Regex("\\s+"), "_")
                .replace(Regex("[^a-z0-9_-]"), "")
                .replace(Regex("_+"), "_")
                .trim('_')
        }
    }
}