auc <- function(path, posteriorColumnName, labelColumnName){
	data <- read.csv(file=path, head=TRUE, sep=",");
	data <- data[with(data, order(-data[,posteriorColumnName])), ];

	fp <- 0;
	tp <- 0;
	index <- 0;
	previous <- 2;
	falsePositive = c();
	truePositive = c();
	#totalTP <- sum(data[labelColumnName]);
	#totalFP <- nrow(data) - totalTP;
	#print(totalTP);
	#print(totalFP);
	area <- 0;
	areaIndex <- 0;

	for(val in data[, posteriorColumnName]){
		index <- index + 1;
		if(val != previous){
			areaIndex <- areaIndex + 1;
			previous <- val;
			falsePositive <- c(falsePositive, fp);
			truePositive <- c(truePositive, tp);
			if(areaIndex > 1){
				area <- area + trapezium(falsePositive[areaIndex - 1], truePositive[areaIndex - 1], falsePositive[areaIndex], truePositive[areaIndex]);
			}
		}
		if(data[index, labelColumnName] == 1){
			tp <- tp + 1;
		} else if(data[index, labelColumnName] == 0){
			fp <- fp + 1;
		}
	}
	falsePositive <- c(falsePositive, fp);
	truePositive <- c(truePositive, tp);
	area <- area + trapezium(falsePositive[areaIndex], truePositive[areaIndex], falsePositive[areaIndex+1], truePositive[areaIndex+1]);
	area <- area/(tp*fp);
	#result <- cbind(falsePositive, truePositive);
	#print(result);

	return(area);
}

aucArray <- function(pathFiles, posteriorColumnName, labelColumnName){
	areas = c();
	for(path in pathFiles){
		areas = c(areas, auc(pathFiles, posteriorColumnName, labelColumnName));
	}

	return(areas);
}

trapezium <- function(X1, Y1, X2, Y2){
	return(abs(X2 - X1)*((Y1 + Y2)/2));
}
