# models/training.py
import pandas as pd, joblib, os
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
from models.preprocessing import preprocess
from config import MODEL_PATH, DATASET_PATH

def train_model(dataset_path=None):
    path = dataset_path or DATASET_PATH
    df = pd.read_csv(path)

    # augment small dataset with slight noise so cross-val is valid
    augmented = []
    for _ in range(10):
        noise = df.copy()
        for col in ['attendance','quiz','assignment','midterm','study_hours']:
            noise[col] = noise[col] + np.random.normal(0, 1.5, len(noise))
            noise[col] = noise[col].clip(0, 100)
        noise['gpa'] = (noise['gpa'] + np.random.normal(0, 0.05, len(noise))).clip(0, 4.0)
        augmented.append(noise)
    df_aug = pd.concat([df] + augmented, ignore_index=True)

    X, y = preprocess(df_aug)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)

    lr = LinearRegression()
    lr.fit(X_train, y_train)

    y_pred_rf = rf.predict(X_test)
    rf_r2 = r2_score(y_test, y_pred_rf)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))

    y_pred_lr = lr.predict(X_test)
    lr_r2 = r2_score(y_test, y_pred_lr)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({'rf': rf, 'lr': lr, 'r2': rf_r2, 'rmse': rf_rmse}, MODEL_PATH)

    return {
        'rf_r2': round(rf_r2 * 100, 1),
        'lr_r2': round(lr_r2 * 100, 1),
        'rmse': round(rf_rmse, 3),
        'samples': len(df_aug)
    }

if __name__ == '__main__':
    result = train_model()
    print("Training complete:", result)
