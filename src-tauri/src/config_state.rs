use serde::Serialize;
use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Serialize)]
pub struct ConfigSnapshot {
    pub revision: u64,
    pub values: BTreeMap<String, Value>,
}

pub struct ConfigState {
    path: PathBuf,
    values: BTreeMap<String, Value>,
    pub revision: u64,
    ready: bool,
}

impl ConfigState {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            values: BTreeMap::new(),
            revision: 0,
            ready: false,
        }
    }

    pub fn snapshot(&self) -> Result<ConfigSnapshot, String> {
        if !self.ready {
            return Err("Configuration could not be loaded".into());
        }
        Ok(ConfigSnapshot {
            revision: self.revision,
            values: self.values.clone(),
        })
    }

    pub fn get(&self, key: &str) -> Option<Value> {
        self.values.get(key).cloned()
    }

    pub fn is_empty(&self) -> bool {
        self.ready && self.values.is_empty()
    }

    fn persist(&self, values: &BTreeMap<String, Value>) -> Result<(), String> {
        let parent = self.path.parent().ok_or("Invalid configuration path")?;
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        let mut temporary =
            tempfile::NamedTempFile::new_in(parent).map_err(|error| error.to_string())?;
        serde_json::to_writer(&mut temporary, values).map_err(|error| error.to_string())?;
        temporary
            .as_file()
            .sync_all()
            .map_err(|error| error.to_string())?;
        temporary
            .persist(&self.path)
            .map_err(|error| error.to_string())?;
        Ok(())
    }

    fn commit(&mut self, values: BTreeMap<String, Value>) -> Result<ConfigSnapshot, String> {
        if !self.ready || self.values != values {
            self.revision += 1;
            self.values = values;
            self.ready = true;
        }
        self.snapshot()
    }

    pub fn reload(&mut self) -> Result<ConfigSnapshot, String> {
        let values = match fs::read(&self.path) {
            Ok(bytes) => serde_json::from_slice(&bytes).map_err(|error| error.to_string())?,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound && !self.ready => {
                let values = BTreeMap::new();
                self.persist(&values)?;
                values
            }
            Err(error) => return Err(error.to_string()),
        };
        self.commit(values)
    }

    pub fn replace(&mut self, values: BTreeMap<String, Value>) -> Result<ConfigSnapshot, String> {
        self.snapshot()?;
        if self.values != values {
            self.persist(&values)?;
        }
        self.commit(values)
    }

    pub fn write(&mut self, values: BTreeMap<String, Value>) -> Result<ConfigSnapshot, String> {
        let mut next = self.snapshot()?.values;
        next.extend(values);
        self.replace(next)
    }

    pub fn initialize(
        &mut self,
        key: String,
        default_value: Option<Value>,
    ) -> Result<ConfigSnapshot, String> {
        self.snapshot()?;
        if self.values.contains_key(&key) {
            return self.snapshot();
        }
        match default_value {
            Some(value) => self.write(BTreeMap::from([(key, value)])),
            None => self.snapshot(),
        }
    }

    pub fn remove(&mut self, key: &str) -> Result<ConfigSnapshot, String> {
        let mut next = self.snapshot()?.values;
        next.remove(key);
        self.replace(next)
    }
}
