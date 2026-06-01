use serde::{Deserialize, Serialize};
use validator::Validate;

const DEFAULT_PAGE: u32 = 1;
const DEFAULT_PAGE_SIZE: u32 = 20;

#[derive(Debug, Clone, Copy, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Pagination {
    #[serde(default = "default_page")]
    #[validate(range(min = 1))]
    pub page: u32,

    #[serde(default = "default_page_size")]
    #[validate(range(min = 1, max = 100))]
    pub page_size: u32,
}

const fn default_page() -> u32 {
    DEFAULT_PAGE
}

const fn default_page_size() -> u32 {
    DEFAULT_PAGE_SIZE
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: DEFAULT_PAGE,
            page_size: DEFAULT_PAGE_SIZE,
        }
    }
}

impl Pagination {
    pub fn limit(self) -> i64 {
        i64::from(self.page_size)
    }

    pub fn offset(self) -> i64 {
        let zero_indexed = self.page.saturating_sub(1);
        i64::from(zero_indexed).saturating_mul(i64::from(self.page_size))
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Paginated<T> {
    pub items: Vec<T>,
    pub page: u32,
    pub page_size: u32,
    pub total: i64,
    pub total_pages: u32,
}

impl<T> Paginated<T> {
    pub fn new(items: Vec<T>, pagination: Pagination, total: i64) -> Self {
        let total_pages = if total <= 0 {
            0
        } else {
            let denom = i64::from(pagination.page_size).max(1);
            let pages = (total + denom - 1) / denom;
            u32::try_from(pages).unwrap_or(u32::MAX)
        };

        Self {
            items,
            page: pagination.page,
            page_size: pagination.page_size,
            total,
            total_pages,
        }
    }
}
