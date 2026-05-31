use std::sync::LazyLock;

use regex::Regex;

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_USERNAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-zA-Z0-9_]{3,32}$").expect("PATTERN_USERNAME regex should be valid"));

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_PASSWORD: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[a-zA-Z0-9_!@#$%^&*()_+=-]{8,255}$").expect("PATTERN_PASSWORD regex should be valid")
});

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_TITLE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-zA-Z0-9 _-:\s]+$").expect("PATTERN_TITLE regex should be valid"));

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_SLUG: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z0-9-]+$").expect("PATTERN_SLUG regex should be valid"));
